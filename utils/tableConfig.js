const models = require("../admissionService/models");
const phyically_disable = require("../admissionService/models/phyically_disable");

const tableConfig = {
  Cast: {
    model: models.caste_master,
    
  },
  Phyically_disable: {
    model:models.phyically_disable,
   
  },
  State:{
     model:models.State,

  },
  City:{
     model:models.City,

  }
};

module.exports = { tableConfig };



