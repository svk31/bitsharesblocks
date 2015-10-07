module.exports = api => {
  return {
    subWitness: callback => {
      api.sub(callback, 'witness_update');
    },

    unSubWitness: () => {
      api.unSub('witness_update');
    }
  };
};
