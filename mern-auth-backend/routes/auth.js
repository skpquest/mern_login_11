const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification.js");
const nodemailer = require("nodemailer");
var jwtSecret = "mysecrettoken";



var transporter = nodemailer.createTransport({
 
  service: "gmail",
  auth: {
    user: "swatikaithwas@questglt.org",
    pass: "Swati@9140",
  },
});



// @route   POST /users
// @description    Register user
// @access  Public

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
        return;
      }
      user = new User({
        name,
        email,
        password,
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      await user.save();


      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.status(200).json({success:true, data:{ token ,user:payload.user}});

      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({success:false,error:{message:"Server error"}});
    }
  }
);

// @route   GET /users/auth
// @description    Get user by token/ Loading user
// @access  Private

router.get("/auth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /users/auth
// @description    Authentication user & get token/ Login user
// @access  Public

router.post(
  "/auth",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: "5 days" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);



const sendOTPVerificationEmail = async (req, res) => {
  try {
    
    console.log(req.body);
    const {userId,email} = req.body;
    if(!userId || !email){
      throw new Error("userId or email is missing in body!");
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    console.log(otp);
    const mailOptions = {
      from: "swatikaithwas@questglt.org",
      to: email,
      subject: "Verify emaail",
      html: `<p> This email for otp verfication<b>${otp}</b></p>`,
    };

    const newUserOTPVerfication = await new UserOTPVerification({
      userId: req.body.userId,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    console.log(newUserOTPVerfication);

    await newUserOTPVerfication
      .save()
      .then((resp) => {
        console.log("success");
        if (resp) {
          res.send({
            status: true,
            message: "opt send successfull",
            otp: otp,
          });
        }
      })
      .catch((err) => {
        console.log("err:", err);
      });

    await transporter.sendMail(mailOptions);
    console.log(mailOptions);
    return {
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        userId: _id,
        email,
      },
    };
  } catch (err) {
    return {
      status: "failed",
      message: "error",
    };
  }
};
// @route   POST /users/otp
// @description    Authentication user & get token/ send otp
// @access  Public
router.post("/otp", sendOTPVerificationEmail);

// @route   POST /users/otpverification
// @description    Authentication user & get token/ check otpverification
// @access  Public

router.post(
  "/otpverification",

  async (req, res) => {
    try {
      let { userId, otp } = req.body;

      if (!userId || !otp) {
        throw new Error("Empty otp details are not allowed");
      } else {
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId,
        });

        if (UserOTPVerificationRecords.length == 0) {
          throw new Error("Account record doesn't exist");
        } else {
          // otp expire time
          const { expiresAt } = UserOTPVerificationRecords[0];

          const hashedOTP = UserOTPVerificationRecords[0].otp;

          if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteMany({ userId });
            throw new Error("Code has expired.Please request again.");
          } else {
            const validOTP = await otp;
            //  if otp will be matched condition
            if (!validOTP) {
              throw new Error("Invalid code passed.Check your inbox.");
            } else {
              await User.updateOne({ _id: userId }, { verified: true });
              await UserOTPVerification.deleteMany({ userId });
              res.json({
                status: "VERIFIED",
                message: "User email sussess full",
              });
            }
          }
        }
      }
    } catch (error) {
      res.json({
        status: "failed",
        message: error.message,
      });
    }
  }
);

module.exports = router;