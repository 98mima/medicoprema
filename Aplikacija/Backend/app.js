const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const auth = require('./routes/auth');
const commRoutes = require('./routes/comment');
const userRoutes = require('./routes/user');
const impRoutes = require('./routes/impression');
const taskRoutes = require('./routes/task');
const reqRoutes = require('./routes/request');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

//const authRoutes = require('./routes/auth');

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);//req koji se ne nadje u shop ide u auth
app.use('/auth', auth);
app.use('/comment', commRoutes);
app.use('/user', userRoutes);
app.use('/impression', impRoutes);
app.use('/task', taskRoutes);
app.use('/request', reqRoutes);

mongoose
  .connect(process.env.DB_CONNECT, {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });