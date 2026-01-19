const fs = require("fs");
const csv = require("csv-parser");
const { State } = require("./models");

async function importStates() {
  const states = [];

  fs.createReadStream("states.csv")
    .pipe(csv())
    .on("data", (row) => {
      states.push(row);
    })
    .on("end", async () => {

      for (let s of states) {
        await State.create({
          id:s.id,  
          value: s.value,       
           
        });
      }

      console.log("state imported successfully!");
    });
}

importStates();
