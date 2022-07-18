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

// @route   POST /users
// @description    Register user
// @access  Public
// smtp-mail.outlook.com
var transporter = nodemailer.createTransport({
  // // host: "mailtrap",

  // auth: {
  //   user: "harshalpagar@questglt.org",
  //   pass: "harsh@quest",
  // },
  service: "gmail",
  auth: {
    user: "asdfqweerrccb@limitlesscircle.com",
    pass: "qwerr@wee",
  },
});

// var mailOptions = {
//   from: "youremail@gmail.com",
//   to: "myfriend@yahoo.com",
//   subject: "Sending Email using Node.js",
//   text: "That was easy!",
// };

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

    const { name, email, password, verifiy } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      user = new User({
        name,
        email,
        password,
        verifiy: false,
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      // sendOTPVerificationEmail(res);

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
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

//  api for opt verifiy
// router.post(
//   "/otp",

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: "asdfqweerrccb@limitlesscircle.com",
      to: "swatikaithwas8@gmail.com",
      subject: "Verify emaail",
      html: `<b>$(otp)</b>`,
    };
    const saltRounds = 10;
    const hasedOTP = await bcrypt.hash(otp, saltRound);
    const newUserOTPVerfication = await new UserOTPVerification({
      userId: id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      date: {
        userId: _id,
        email,
      },
    });
  } catch (err) {
    res.json({
      status: "failed",
      message: "error",
    });
  }
};
// );
router.post("/otp", sendOTPVerificationEmail);
// otp verfication
router.post(
  "/otpverification",

  async (req, res) => {
    try {
      let { userId, otp } = req.body;

      if (!userId || !otp) {
        throw Error("Empty otp details are not allowed");
      } else {
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId,
        });
        if (UserOTPVerificationRecords.length <= 0) {
          throw new Error("Account record doesn't exist");
        } else {
          const { expiresAt } = UserOTPVerificationRecords[0];
          const hashedOTP = UserOTPVerificationRecords[0].otp;
          if (expiresAt < Date.now()) {
            await UserOTPVerfication.deleteMany({ userId });
            throw new Error("Code has expired. Please request again.");
          } else {
            const validOTP = await bcrypt.compare(otp, hashedOTP);
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
    } catch (err) {
      res.json({
        status: "failed",
        message: "error",
      });
    }
  }
);

module.exports = router;

// .then((result) => {
//   sendOTPVerificationEmail(result, res);
//   console.log(sendOTPVerificationEmail(result, res));
// }).catch((err) => {
//   console.error(err.message);
//   res.json({
//     status: "FAILED",
//     message: "An error occurred while saving user account!",
//   });
// });
