const demoService = require('../services/demoService');
const { sendSuccess } = require('../utils/apiResponse');

async function addSampleData(req, res) {
  const counts = await demoService.addSampleData(req.user.id);
  return sendSuccess(res, { statusCode: 201, message: 'Sample data added.', data: counts });
}

module.exports = { addSampleData };
