module.exports = {
  success: (res, data, message = 'Operação bem-sucedida', statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },
  
  error: (res, message = 'Erro na operação', statusCode = 400, error = null) => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error
    });
  }
};