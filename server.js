

const express = require('express');
const app=express()
const mongoose= require('mongoose');
const dotEnv = require('dotenv');
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const port=process.env.port || 2004
const ejs = require('ejs');
const session = require('express-session');
const nodemailer = require('nodemailer');
const MongoDBStore = require('connect-mongodb-session')(session);
const crypto = require('crypto');
const Staff = require('./models/Staff');
const StaffAuth = require('./models/StaffAuth');
const Dish = require('./models/Dish');
const Chef=require('./models/Chef');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Table = require('./models/Table');
app.set('view engine', 'ejs');
app.use(express.static('public'));

dotEnv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const store=new MongoDBStore({
        uri: process.env.MONGO_URL,
        collection: 'mySessions'
    });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/staff'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });


cloudinary.config({
  cloud_name: 'de98eawax',
  api_key: '465751656626493',
  api_secret: 'W_oPiG4g7E10IkNWFmuhSWkPWyo'
});
const dishStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dishes', 
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const dishUpload = multer({ storage: dishStorage });

const chefStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chefs', 
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});
const chefUpload = multer({ storage: chefStorage });

app.use(session({
  secret: 'This is a secret key',
  resave: false,
  saveUninitialized: true,
  store: store,
  
  rolling: true
}));


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Mongoose successfully connected to MongoDB");
})
.catch(err => {
  console.error("❌ Mongoose connection error:", err);
});

    
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})


app.get('/', (req, res) => {
  res.render('index');
});
app.get('/owner/owner-login', (req, res) => {
    res.render('owner/owner_login');
});
const OWNER_EMAIL = 'sunkarassnaidu@gmail.com';
const OWNER_PASSWORD = 'Sunkara@2004';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sunkarassnaidu@gmail.com',
    pass: 'ptoc liun kfca kqhf' 
  }
});

async function notifyOwner(subject, message) {
  try {
    await transporter.sendMail({
      from: 'sunkarassnaidu@gmail.com',
      to: 'sunkarassnaidu@gmail.com',
      subject,
      text: message
    });
    console.log('📨 Notification sent to owner.');
  } catch (error) {
    console.error('❌ Failed to notify owner:', error);
  }
}

app.post('/owner-login', (req, res) => {
  const { email, password } = req.body;

  if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    req.session.email = email;
    req.session.otpGeneratedAt = Date.now();

   
    const mailOptions = {
      from: 'sunkarassnaidu@gmail.com',
      to: email,
      subject: 'Your OTP for LakshyaFiesta Owner Login',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending OTP email:', err);
        return res.render('owner/owner_login', { error: 'Failed to send OTP. Try again.' });
      }
     
      res.redirect('/owner/owner-verify');
    });
  } else {
    res.render('owner/owner_login', { error: 'Invalid email or password' });
  }
});

app.get('/owner/owner-verify', (req, res) => {
  
  if (!req.session.email) {
    return res.redirect('/owner/owner-login');
  }

  const now = Date.now();
  const otpExpired = req.session.otpGeneratedAt && now - req.session.otpGeneratedAt > 5 * 60 * 1000;

  if (otpExpired) {
    req.session.otp = null;
    req.session.otpGeneratedAt = null;
    return res.render('owner/owner-verify', { error: 'OTP expired. Please request a new one.' });
  }

  res.render('owner/owner-verify', { error: null });
});





app.post('/owner-verify', (req, res) => {
  const { otp } = req.body;
  const now = Date.now();
  
  if (!req.session.otp || !req.session.otpGeneratedAt) {
    return res.render('owner/owner-verify', { error: 'OTP expired or not requested. Please login again.' });
  }

  
  const otpExpired = now - req.session.otpGeneratedAt > 5 * 60 * 1000;

  if (otpExpired) {
    req.session.otp = null;
    req.session.otpGeneratedAt = null;
    return res.render('owner/owner-verify', { error: 'OTP expired. Please request a new one.' });
  }

  
  if (otp === req.session.otp) {
    req.session.otp = null;
    req.session.otpGeneratedAt = null;
    req.session.isOwnerLoggedIn = true;
    res.redirect('/owner/owner-dashboard');
  } else {
    res.render('owner/owner-verify', { error: 'Incorrect OTP. Please try again.' });
  }
});

app.get('/owner-resend-otp', (req, res) => {
  if (!req.session.email) {
    return res.redirect('/owner/owner-login');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;
  req.session.otpGeneratedAt = Date.now(); 

  const mailOptions = {
    from: 'sunkarassnaidu@gmail.com',
    to: req.session.email,
    subject: 'Resent OTP for LakshyaFiesta Owner Login',
    text: `Your new OTP is ${otp}. It is valid for 5 minutes.`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Error resending OTP:', err);
      return res.render('owner/owner-verify', { error: 'Failed to resend OTP. Try again.' });
    }
    res.render('owner/owner-verify', { error: 'New OTP sent to your email.' });
  });
});




app.get('/owner/owner-dashboard', async (req, res) => {
  if (!req.session.isOwnerLoggedIn) {
    return res.redirect('/owner/owner-login');
  }

  
    
    res.render('owner/owner-dashboard');
  
});

app.get('/owner/add-staff', (req, res) => {
  res.render('owner/add-staff', { error: null, success: null });
});


app.post('/add-staff', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      gender,
      dateOfBirth,
      accountHolderName,
      accountNumber,
      ifscCode
    } = req.body;

    const image = req.file.filename;

    const newStaff = new Staff({
      name,
      email,
      phone,
      address,
      gender,
      image,
      dateOfBirth,
      dateOfJoining: new Date(), 
      accountDetails: {
        accountHolderName,
        accountNumber,
        ifscCode
      }
    });

    await newStaff.save();
    res.render('owner/add-staff', { success: "Staff added successfully!", error: null });

  } catch (err) {
    res.status(500).render('owner/add-staff', {
      success: null,
      error: "Error adding staff: " + err.message
    });
  }
});

app.post('/owner/add-chef', chefUpload.single('image'), async (req, res) => {
  try {
    const chef = new Chef({
      name: req.body.name,
      email: req.body.email,
      specialty: req.body.specialty,
      phone: req.body.phone,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      image: req.file.path, // Cloudinary URL
      joinDate: new Date() // Automatically set to current date
    });

    await chef.save();
    res.render('owner/add-staff', { success: "Staff added successfully!", error: null });
  } catch (err) {
    console.error("Failed to add chef:", err);
    res.status(500).send("Server error");
  }
});


app.get('/owner/manage-staff', async (req, res) => {
  try {
    const staffList = await Staff.find({});
    res.render('owner/manage-staff', { staffList });
  } catch (err) {
    res.status(500).send('Error fetching staff details.');
  }
});


app.post('/delete-staff/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.redirect('/owner/manage-staff');
  } catch (err) {
    res.status(500).send('Error deleting staff');
  }
});


app.get('/owner/update-staff/:id', async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) return res.status(404).send('Staff not found');
  res.render('owner/update-staff', { staff });
});


app.post('/update-staff/:id', upload.single('image'), async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    gender,
    dateOfBirth,
    accountHolderName,
    accountNumber,
    ifscCode
  } = req.body;

  const updateData = {
    name,
    email,
    phone,
    address,
    gender,
    dateOfBirth,
    accountDetails: {
      accountHolderName,
      accountNumber,
      ifscCode
    }
  };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  try {
    await Staff.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/owner/manage-staff');
  } catch (err) {
    res.status(500).send("Error updating staff: " + err.message);
  }
});



app.get('/staff/staff-login', (req, res) => {
  res.render('staff/staff-login', { error: null });
});



app.post('/staff-login', async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findOne({ email });
  if (!staff) return res.render('staff/staff-login', { error: 'Staff email not registered.' });

  const auth = await StaffAuth.findOne({ email });
  if (!auth) return res.redirect(`/staff/create-password-step1?email=${email}`);

  const match = await bcrypt.compare(password, auth.password);
  if (!match) return res.render('staff/staff-login', { error: 'Incorrect password.' });

  req.session.isStaffLoggedIn = true;
  req.session.staffEmail = email;

  //  Notify owner
  await notifyOwner(
    'Staff Login Notification',
    `Staff "${staff.name}" has logged in on ${new Date().toLocaleString()}.`
  );

  res.redirect('/staff/staff-dashboard');
});



app.get('/staff/create-password-step1', (req, res) => {
  res.render('staff/create-password-step1', { error: null });
});


app.post('/create-password-step1', async (req, res) => {
  const { email } = req.body;

  const staff = await Staff.findOne({ email });
  if (!staff) return res.render('staff/create-password-step1', { error: 'Email not found in staff list.' });

  const existing = await StaffAuth.findOne({ email });
  if (existing) return res.redirect('/staff/staff-login');

  res.render('staff/create-password', { email });
});


app.post('/create-password', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match.');
  }

  const staff = await Staff.findOne({ email });
  if (!staff) return res.send('Email not found.');

  const existing = await StaffAuth.findOne({ email });
  if (existing) return res.redirect('/staff/staff-login');

  const hashed = await bcrypt.hash(password, 10);
  await StaffAuth.create({ email, password: hashed });

  // Notify owner
  await notifyOwner(
    'Staff Password Created',
    `Staff "${staff.name}" has created a password on ${new Date().toLocaleString()}.`
  );

  res.redirect('/staff/staff-login');
});

app.get('/staff/staff-dashboard', async (req, res) => {
  if (!req.session.isStaffLoggedIn) return res.redirect('/staff/staff-login');

  const staff = await Staff.findOne({ email: req.session.staffEmail });
  if (!staff) return res.redirect('/staff/staff-login');

  res.render('staff/staff-dashboard', { staff,email: req.session.staffEmail });
});


app.get('/owner/add-dish', async (req, res) => {
  if (!req.session.isOwnerLoggedIn) return res.redirect('/owner/owner-login');

  try {
    const dishes = await Dish.find().sort({ dishNo: 1 }); 
    res.render('owner/add-dish', { success: null, error: null, dishes });
  } catch (err) {
    res.render('owner/add-dish', { success: null, error: "Failed to load dishes", dishes: [] });
  }
});

app.post('/owner/add-dish', dishUpload.single('image'), async (req, res) => {
  const { category, name, price } = req.body;
  const file = req.file;

  try {
    const lastDish = await Dish.findOne().sort({ dishNo: -1 });
    const newId = lastDish ? 'D' + String(parseInt(lastDish.dishNo.slice(1)) + 1).padStart(3, '0') : 'D001';

    const newDish = new Dish({
      dishNo: newId,
      category,
      name,
      price,
      image: file.path // ✅ cloudinary image url
    });

    await newDish.save();

    const dishes = await Dish.find().sort({ dishNo: 1 });
    res.render('owner/add-dish', { success: "Dish added successfully", error: null, dishes });

  } catch (err) {
    const dishes = await Dish.find().sort({ dishNo: 1 });
    res.render('owner/add-dish', {
      success: null,
      error: "Failed to add dish: " + err.message,
      dishes
    });
  }
});


app.get('/owner/edit-dish/:id', async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  res.json(dish);
});


app.post('/owner/update-dish/:id', async (req, res) => {
  const { category, name, price } = req.body;
  await Dish.findByIdAndUpdate(req.params.id, { category, name, price });
  res.redirect('/owner/add-dish');
});


app.post('/owner/delete-dish/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).send('Dish not found');

    
    const imagePath = path.join(__dirname, 'public', 'images', 'dishes', dish.image);

    
    fs.unlink(imagePath, async (err) => {
      if (err) {
        console.error("Image deletion failed:", err);
        
      }

      
      await Dish.findByIdAndDelete(req.params.id);
      res.redirect('/owner/add-dish');
    });

  } catch (err) {
    console.error("Error deleting dish:", err);
    res.status(500).send("Server error while deleting dish.");
  }
});



app.get('/staff/order/:tableId', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    const dishes = await Dish.find();

   

    const categories = [...new Set(dishes.map(d => d.category))];
    const dishesByCategory = categories.map(cat => ({
      category: cat,
      dishes: dishes.filter(d => d.category === cat)
    }));

    

    res.render('staff/order', {
      dishes,
      dishesByCategory, tableId 
    });

  } catch (err) {
    console.error("❌ Error loading /owner/order route:", err);
    res.status(500).send("Server error: Could not load order page.");
  }
});



app.post('/owner/add-table', async (req, res) => {
  try {
   
    const last = await Table.findOne().sort({ tableNo: -1 });
    let nextNo = 1;

    if (last && last.tableNo) {
      const match = last.tableNo.match(/\d+/);
      nextNo = match ? parseInt(match[0]) + 1 : 1;
    }

    const newTableNo = `T${String(nextNo).padStart(2, '0')}`;
    const table = new Table({ tableNo: newTableNo });
    await table.save();

    res.redirect('/owner/owner-dashboard');
  } catch (err) {
    res.status(500).send('Error adding table: ' + err.message);
  }
});


app.get('/api/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});


app.get('/api/servant-tables', async (req, res) => {
  if (!req.session.staffEmail) return res.status(403).json({ error: 'Not logged in' });

  try {
    const email = req.session.staffEmail;
    const tables = await Table.find();

    const active = tables.filter(t => t.status !== 'empty' && t.serverEmail === email);
    const empty = tables.filter(t => t.status === 'empty');

    res.json({ active, empty });
  } catch (err) {
    console.error(" Error loading servant tables:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/staff/click-table/:tableId', async (req, res) => {
  if (!req.session.staffEmail) return res.status(403).json({ error: 'Unauthorized' });

  try {
    const staff = await Staff.findOne({ email: req.session.staffEmail });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    const table = await Table.findById(req.params.tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    // Only update if table is empty
    if (table.status === 'empty') {
      table.serverEmail = staff.email;
      table.serverName = staff.name;
      table.serverImage = staff.image;
      table.status = 'taking';
      table.orderStartTime = new Date();

      await table.save();

      return res.json({ success: true });
    } else {
      return res.json({ success: true, message: 'Table already in use.' });
    }
  } catch (err) {
    console.error("❌ Error updating table:", err);
    return res.status(500).json({ error: 'Failed to update table' });
  }
});


app.post('/staff/reset-table/:id', async (req, res) => {
  try {
    const tableId = req.params.id;

    const updated = await Table.findOneAndUpdate(
      { _id: tableId, status: 'taking' },  // ✅ Only update if status is 'taking'
      {
        status: 'empty',
        serverName: null,
        serverEmail: null,
        serverImage: null,
        orderStartTime: null,
        food: []
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ success: true, message: 'Reset allowed only if status is "taking"' });
    }

    res.status(200).json({ success: true, message: 'Table reset successfully' });
  } catch (err) {
    console.error("Error resetting table:", err);
    res.status(500).json({ success: false, message: 'Error resetting table' });
  }
});


app.get('/api/table-food/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).lean();
    if (!table || !table.food) return res.json([]);

    const dishNos = table.food.map(f => f.dishNo); // ✅ Use dishNo here
    const dishes = await Dish.find({ dishNo: { $in: dishNos } }).lean();

    const fullDetails = table.food.map(item => {
      const dish = dishes.find(d => d.dishNo === item.dishNo);
      return dish ? {
        dishNo: item.dishNo,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: item.quantity
      } : null;
    }).filter(Boolean); // Remove nulls

    res.json(fullDetails);
  } catch (err) {
    console.error("Error loading table food:", err);
    res.status(500).json([]);
  }
});

app.post('/staff/place-order/:tableId', async (req, res) => {
  try {
    const { selectedDishes } = req.body; // Expected: [{ dishId: '...', quantity: 2 }]

    if (!Array.isArray(selectedDishes) || selectedDishes.length === 0) {
      return res.status(400).json({ success: false, message: 'No dishes selected' });
    }

    const table = await Table.findById(req.params.tableId);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    const existingFood = table.food || [];

    selectedDishes.forEach(newDish => {
      const existing = existingFood.find(f => f.dishId && f.dishId.toString() === newDish.dishId);
      if (existing) {
        existing.quantity += newDish.quantity;
      } else {
        existingFood.push(newDish);
      }
    });

    table.food = existingFood;
    table.status = 'waiting'; // Update status if required
    await table.save();

    return res.json({ success: true, message: 'Order placed successfully' });

  } catch (err) {
    console.error("❌ Failed to place order:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.get('/staff/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Error logging out.");
    res.redirect('/staff/staff-login');
  });
});

app.get('/owner/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).send("Error logging out.");
    }
    res.render('owner/logout-success'); 
  });
});



