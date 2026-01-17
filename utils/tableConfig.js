const models = require("../admissionService/models");

const tableConfig = {
  Cast: {
    model: models.caste_master,
    labelColumn: "cast_name",
    valueColumn: "id",
  },
};

module.exports = { tableConfig };



