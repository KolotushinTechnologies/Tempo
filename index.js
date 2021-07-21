const app = require("../../app/app");
const http = require("http");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;
app.set("port", port);

const server = http.createServer(app);

const start = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true,
      },
      (err) => {
        if (!err) {
          return console.log("Connected to Database MongoDB!");
        }

        return console.log(
          `Please check if the database connection is correct: "${err}"`
        );
      }
    );

    server.listen(port, () => console.log(`Server started on PORT ${port}`));
  } catch (err) {
    console.log(err);
  }
};

start();
