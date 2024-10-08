import { User } from "../Model/User.js";
import jwt  from "jsonwebtoken";
import { createTransport } from "nodemailer";
import bcryptjs from "bcryptjs";

/**
 * @description Send Forgot Password Link
 * @route       /password/forgot-password
 * @method      POST
 * @access      public
 */
const sendForgotPasswordLink = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.registed === false) {
    return res.status(400).json({ message: "Complete creating your account" });
  }

  const secret = process.env.JWT_SECRET_KEY + user.password;
  try {
    const token = await jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      secret,
      { expiresIn: "10m" }
    );

    const link = `https://e-commerce-production-2d41.up.railway.app/password/rest-password/${user._id}/${token}`;

    const trnasporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS_USER_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Rest Password",
      html: `
      <div>
        <h2>Click on the button below to reset your password</h2>
        <p>${link}</p>
      </div>
      `,
    };

    trnasporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(error);
        return Error("error trnasporter");
      } else {
        console.log("Email send:" + success.response);
      }
    });

    res.status(200).json({
      message: "Link for reset your password has been send to your email",
      token,
      userId: user._id,
    });
  } catch (err) {
    console.log("error sendForgotPasswordLink: ", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @description Rest Password
 * @route       /password/rest-password/:id/:token
 * @method      POST
 * @access      public
 */
//
const resetThePassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const secret = process.env.JWT_SECRET_KEY + user.password;

  try {
    jwt.verify(req.params.token, secret);
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(req.body.password, salt);
    await user.save();

    res.status(200).json({ message: "Rest password successfully" });
  } catch (err) {
    console.log("error resetThePassword: ", err);
    res.status(500).json({ error: "Server error" });
  }
};

export  {
  sendForgotPasswordLink,
  resetThePassword,
};
