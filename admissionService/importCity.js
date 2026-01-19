const fs = require("fs");
const csv = require("csv-parser");
const { City } = require("./models");

async function importCities() {
  const cities = [];

  fs.createReadStream("cities.csv")
    .pipe(csv())
    .on("data", (row) => {
      cities.push(row);
    })
    .on("end", async () => {

      for (let c of cities) {
        await City.create({
          value: c.value,       // city name column
          stateId: c.stateId   // stateId column from CSV
        });
      }

      console.log("Cities imported successfully!");
    });
}

importCities();
