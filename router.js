const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

class Router {
  constructor(app, db) {
    this.login(app, db);
    this.createAccount(app, db);
    this.verifyAccount(app, db);
    this.UpdatePersonal(app, db);
    this.UpdatePassword(app, db);
    this.ScheduleShipment(app, db);
    this.CreditCard(app, db);
    this.logout(app, db);
    this.isLoggedIn(app, db);
    this.fetchhistory(app, db);
    this.DeleteCard(app, db);
    this.fetchcard(app, db);
    this.trackingshipment(app, db);
  }
  login(app, db) {
    app.post("/login", (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      console.log(username, password);

      username = username.toLowerCase();
      let cols = [username];
      db.query(
        "SELECT * FROM users WHERE username = ? LIMIT 1",
        cols,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data && data.length === 1) {
            bcrypt.compare(
              password,
              data[0].password,
              (bcryptErr, verified) => {
                if (verified) {
                  req.session.userID = data[0].id;
                  res.json({
                    success: true,
                    sessionID: data[0].id,
                    username: data[0].username,
                    name: data[0].name,
                    state: data[0].state,
                    address: data[0].address,
                  });
                  return;
                } else {
                  res.json({
                    success: false,
                    msg: "invalid  password",
                  });
                  return;
                }
              }
            );
          } else {
            res.json({
              success: false,
              msg: "invalid username or password",
            });
            return;
          }
        }
      );
    });
  }
  verifyAccount(app, db) {
    app.post("/signup", (req, res) => {
      db.query(
        "INSERT INTO users SET ?",
        {
          username: req.body.username,
          name: req.body.name,
          state: req.body.state,
          address: req.body.address,
          password: bcrypt.hashSync(req.body.password, 9),
        },
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "account Created",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "you have an error with your form",
            });
            return;
          }
        }
      );
    });
  }
  createAccount(app, db) {
    app.post("/sendmessage", (req, res) => {
      let username = req.body.username;
      let otp = req.body.otp;
      db.query(
        "SELECT * FROM users WHERE username = ? LIMIT 1",
        username,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data && data.length === 1) {
            res.json({
              success: false,
              msg: "Username Already Exist",
            });
            return;
          } else {
            const credentials = {
              apiKey:
                "739c3070dce5bf510a566d6bed6ae1c4c9451652ddc395cd535582da485857a9",
              username: "box1",
            };
            const AfricasTalking = require("africastalking")(credentials);

            // Initialize a service e.g. SMS
            const sms = AfricasTalking.SMS;

            // Use the service
            const options = {
              to: ["+234" + username],
              message:
                "Thank you for creating account with Box1, your verification code is:" +
                otp,
              shortCode: "21524",
              keyword: "Box1 Verification",
            };

            // Send message and capture the response or error
            sms
              .send(options)
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.log(error);
              });

            res.json({
              success: true,
              msg: "Otp sent successfuly",
            });
            return;
          }
        }
      );
    });
  }
  UpdatePersonal(app, db) {
    app.post("/updateinfo", (req, res) => {
      let id = req.body.sessionID;
      db.query(
        "UPDATE users SET name='" +
          req.body.name +
          "', state='" +
          req.body.state +
          "', address='" +
          req.body.address +
          "' WHERE id=?",
        id,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "Updated Successfully",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "server error, try later",
            });
            return;
          }
        }
      );
    });
  }
  UpdatePassword(app, db) {
    app.post("/updatepassword", (req, res) => {
      let id = req.body.sessionID;
      db.query(
        "UPDATE users SET password='" +
          bcrypt.hashSync(req.body.password, 9) +
          "' WHERE id= ?",
        id,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "Password Change Successful",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "server error, try later",
            });
            return;
          }
        }
      );
    });
  }
  ScheduleShipment(app, db) {
    app.post("/scheduledomestic", (req, res) => {
      const trackingid = Math.floor(100000000 + Math.random() * 900000);
      db.query(
        "INSERT INTO pickup SET ?",
        {
          senderid: req.body.sessionID,
          trackingid: parseInt(trackingid),
          senderphone: req.body.senderphone,
          sendername: req.body.sendername,
          fromstate: req.body.from,
          tostate: req.body.to,
          date: req.body.date,
          time: req.body.time,
          plocation: req.body.plocation,
          dlocation: req.body.dlocation,
          rname: req.body.rname,
          rphone: req.body.rphone,
          itemtype: req.body.itemtype,
          itemweight: req.body.itemweight,
          amount: req.body.amount,
          payment: "In cash by sender or receiver",
        },
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            if (req.body.payment === "card") {
              const credentials = {
                apiKey:
                  "739c3070dce5bf510a566d6bed6ae1c4c9451652ddc395cd535582da485857a9", // use your sandbox app API key for development in the test environment
                username: "box1", // use 'sandbox' for development in the test environment
              };
              const AfricasTalking = require("africastalking")(credentials);

              // Initialize a service e.g. SMS
              const sms = AfricasTalking.SMS;

              // Use the service
              const options = {
                to: ["+234" + req.body.senderphone],
                message:
                  "Your Pickup is scheduled and your tracking id is: " +
                  " " +
                  trackingid +
                  " " +
                  "Please Complete your payment to enable us send a biker as soon as possible",
                shortCode: "21524",
                keyword: "Box1 Verification",
              };

              // Send message and capture the response or error
              sms
                .send(options)
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => {
                  console.log(error);
                });

              res.json({
                success: true,
                confirm: "yes",
                msg: "Pickup scheduled successfully, thank you",
              });
              return;
            } else {
              const credentials = {
                apiKey:
                  "739c3070dce5bf510a566d6bed6ae1c4c9451652ddc395cd535582da485857a9", // use your sandbox app API key for development in the test environment
                username: "box1", // use 'sandbox' for development in the test environment
              };
              const AfricasTalking = require("africastalking")(credentials);

              // Initialize a service e.g. SMS
              const sms = AfricasTalking.SMS;

              // Use the service
              const options = {
                to: ["+234" + req.body.senderphone],
                message:
                  "Your Pickup is scheduled and your tracking id is: " +
                  " " +
                  trackingid +
                  " " +
                  "Thank you for trusting us",
                shortCode: "21524",
                keyword: "Box1 Verification",
              };

              // Send message and capture the response or error
              sms
                .send(options)
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => {
                  console.log(error);
                });

              res.json({
                success: true,
                confirm: "no",
                msg: "Pickup scheduled successfully, thank you",
              });
              return;
            }
          } else {
            res.json({
              success: false,
              msg: "you have an error with your form",
            });
            return;
          }
        }
      );
    });
  }

  CreditCard(app, db) {
    app.post("/addcard", (req, res) => {
      db.query(
        "INSERT INTO carddetails SET ?",
        {
          ownerid: req.body.sessionID,
          cardnumber: req.body.number,
          cardname: req.body.name,
          cardexpmonth: req.body.cardexpmonth,
          cardexpyear: req.body.cardexpyear,
          cardcvv: req.body.cvc,
        },
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "Card Saved successfully",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "you have an error with your form",
            });
            return;
          }
        }
      );
    });
  }
  logout(app, db) {
    app.post("/logout", (req, res) => {
      if (req.session.userID) {
        req.session.destroy();
        res.json({
          success: true,
        });

        return;
      } else {
        res.json({
          success: false,
        });
        return;
      }
    });
  }
  isLoggedIn(app, db) {
    app.post("/isLoggedIn", (req, res) => {
      if (req.session.userID) {
        let cols = [req.session.userID];
        db.query(
          "SELECT * FROM users WHERE id = ? LIMIT 1",
          cols,
          (err, data, fields) => {
            if (data && data.length === 1) {
              res.json({
                success: true,
                sessionID: data[0].id,
                username: data[0].username,
                name: data[0].name,
                state: data[0].state,
                address: data[0].address,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }
  fetchhistory(app, db) {
    app.post("/fetchhistory", (req, res) => {
      let id = req.body.sessionID;
      db.query(
        "SELECT * FROM pickup WHERE status='success' AND senderid = ?",
        id,
        (err, data, fields) => {
          if (data) {
            res.end(JSON.stringify(data));
          } else {
            res.json({
              success: false,
              msg: "No data",
            });
          }
        }
      );
    });
  }
  DeleteCard(app, db) {
    app.post("/deletecard", (req, res) => {
      let id = req.body.sessionID;
      db.query(
        "DELETE FROM carddetails WHERE ownerid = ?",
        id,
        (err, data, fields) => {
          if (data) {
            res.end(JSON.stringify(data));
          } else {
            res.json({
              success: false,
              msg: "Please try later",
            });
          }
        }
      );
    });
  }
  fetchcard(app, db) {
    app.post("/fetchcard", (req, res) => {
      let id = req.body.sessionID;
      db.query(
        "SELECT cardname, cardexpmonth, cardexpyear, cardcvv FROM carddetails WHERE ownerid = ?",
        id,
        (err, data, fields) => {
          if (data) {
            res.end(JSON.stringify(data));
          } else {
            res.json({
              success: false,
              msg: "Please try later",
            });
          }
        }
      );
    });
  }
  trackingshipment(app, db) {
    app.post("/trackshipment", (req, res) => {
      let trackingid = req.body.trackingid;
      db.query(
        "SELECT status FROM pickup WHERE trackingid= ?",
        trackingid,
        (err, data, fields) => {
          if (data && data.length === 1) {
            res.json({
              success: true,
              status: data[0].status,
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "This Tracking Id does not exits",
            });
          }
        }
      );
    });
  }
}
module.exports = Router;
