import { createActions } from 'redux-actions';

const notationsActions = createActions({
  NOTATIONS: {
    INDEX: {
      SET: notations => ({ notations }),
    },
    SHOW: {
      SET: notation => ({ notation }),
    },
    EDIT: {
      SET: notation => ({ notation }),
      UPDATE: notation => ({ notation })
    }
  }
});

export default notationsActions;
