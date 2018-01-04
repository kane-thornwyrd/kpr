'use strict';

module.exports = ({ https: { disable } }) => ({ get, url }, { redirect }, next) => {
  if (!disable && get('x-forwarded-proto') !== 'https') {
    return redirect(`https://${get('host')}${url}`);
  }
  return next();
};