module.exports = api => {
  return {
    subHeadBlock: callback => {
      api.sub(callback, 'head_block');
    },

    unSubHeadBlock: () => {
      api.unSub('head_block');
    },

    subDynGlobal: callback => {
      api.sub(callback, 'dyn_global');
    }
  };
};
