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
    user: "swatikaithwas@questglt.org",
    pass: "Swati@9140",
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

    const { name, email, password } = req.body;

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
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // await user.save().then((res) => {
      //   try {
      //     if (res) {
      //       sendOTPVerificationEmail(res);
      //     } else {
      //       res.json({
      //         status: "FAILED",
      //         message: "An error occurred while saving user account!",
      //       });
      //     }
      //   } catch {
      //     (err) => {
      //       console.error(err.message);
      //       res.json({
      //         status: "FAILED",
      //         message: "An error occurred while saving user account!",
      //       });
      //     };
      //   }
      // });

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

const sendOTPVerificationEmail = async (req, res) => {
  try {
    // console.log(res);
    console.log(req.body);

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    console.log(otp);
    const mailOptions = {
      from: "swatikaithwas@questglt.org",
      to: "swatikaithwas8@gmail.com",
      subject: "Verify emaail",
      html: `<b>${otp}</b>`,
    };
    // const saltRounds = 10;
    // const hasedOTP = await bcrypt.hash(otp, saltRounds);
    // console.log(hasedOTP);
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
// );
router.post("/otp", sendOTPVerificationEmail);
// otp verfication
router.post(
  "/otpverification",

  async (req, res) => {
    try {
      let { userId, otp } = req.body;
      // console.log(req.body);
      // console.log(userId);

      if (!userId || !otp) {
        throw Error("Empty otp details are not allowed");
      } else {
        // console.log(userId);
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId,
        });
        // console.log("UserOTPVerificationRecords:", UserOTPVerificationRecords);
        // console.log("UserOTPVerification:", UserOTPVerification);
        if (UserOTPVerificationRecords.length == 0) {
          throw new Error("Account record doesn't exist");
        } else {
          const { expiresAt } = UserOTPVerificationRecords[0];
          console.log(expiresAt);
          const hashedOTP = UserOTPVerificationRecords[0].otp;
          // console.log(hashedOTP);
          if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteMany({ userId });
            throw new Error("Code has expired.Please request again.");
          } else {
            const validOTP = await (otp);
            console.log("validOTP:", validOTP);
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
