const wrapAsync = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
    }
  };
};

export default wrapAsync;
