import nodemailer from "nodemailer";
import { Request } from "express";

export const sendOtpMail = async (
  req: Request,
  email: String,
  username: String
) => {
  const Transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    auth: {
      user: "otakuhubkl@gmail.com",
      pass: "tezt mtsd jdrh sfaf",
    },
  });

  const otp = req.session.otp;
  //html template
  const html: String = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href=""style="font-size:1.4em;color: black;text-decoration:none;font-weight:600">DevDen - Join Events & Celebrate Tech</a>
    </div>
    <p style="font-size:1.1em">Hey ${username},</p>
    <p>To join DevDen Community, use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: black;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />DevDen Team</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>DevDen Inc</p>
      <p>Terms and Privacy</p>
    </div>
  </div>
</div>
    `;

  const content: Object = {
    from: "Otakuhubkl@gmail.com",
    to: email,
    subject: "Otp verification",
    html: html,
  };

  const info = await Transporter.sendMail(content);
};


export const sendResetMail = async (
  req: Request,
  email: String,
  resetToken: String
) => {
  const Transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    auth: {
      user: "otakuhubkl@gmail.com",
      pass: "tezt mtsd jdrh sfaf",
    },
  });

  //html template
  const html: String = `
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href=""style="font-size:1.4em;color: black;text-decoration:none;font-weight:600">DevDen - Join Events & Celebrate Tech</a>
  </div>
  <p style="font-size:1.1em; color:black">Password Reset Link :</p>
  <p>Please click on the following link, or paste this into your browser to complete the process: <br/>
    https://devden.ananthuks.online/reset-password/${resetToken} <br/>
    If you did not request this, please ignore this email and your password will remain unchanged.\n</p>
  <p style="font-size:0.9em;">Regards,<br />DevDen Team</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>DevDen Inc</p>
    <p>Terms and Privacy</p>
  </div>
</div>
</div>
  `;

  const content: Object = {
    from: "Otakuhubkl@gmail.com",
    to: email,
    subject: "Password reset link",
    html: html,
  };

  const info = await Transporter.sendMail(content);
};

