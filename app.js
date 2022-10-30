const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server instance running");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
initializeDBAndServer();

//Show Player List
app.get("/players/", async (request, response) => {
  const playerDetails = `
    select *
    from cricket_team
    order by player_id
    `;
  const allPlayersList = await db.all(playerDetails);
  return response.send(allPlayersList);
});

//Add New Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
insert into
    cricket_team (player_Name, jersey_Number, role)
    values (
        '${playerName}', 
         ${jerseyNumber}, 
         '${role}')
`;
  const dbResponse = await db.run(addPlayer);
  return response.send("Player Added to Team");
});

//Get Player Information
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = `
    select *
    from cricket_team
    where player_id = ${playerId}
    `;
  const myPlayer = await db.get(playerDetails);
  return response.send(myPlayer);
});

//Update Player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerDetails = request.body;

  const { playerName, jerseyNumber, role } = updatePlayerDetails;
  const updatePlayer = `
    update cricket_team
    set player_Name = '${playerName}', 
        jersey_Number = ${jerseyNumber}, 
        role = '${role}'
    where player_id = ${playerId};`;
  await db.run(updatePlayer);
  return response.send("Player Details Updated");
});

//Delete Player History
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    delete
    from cricket_team
    where player_id = ${playerId}
    `;
  await db.run(deletePlayer);
  return response.send("Player Removed");
});

module.exports = app;
