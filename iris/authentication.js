const passport = require('passport');
const { Strategy: TwitterStrategy } = require('passport-twitter');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { getUser, createOrFindUser } = require('./models/user');
const { createNewUsersSettings } = require('./models/usersSettings');

const init = () => {
  // Setup use serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    getUser({ id })
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  });

  // Set up Twitter login
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: 'vxmsICGyIIoT5NEYi1I8baPrf',
        consumerSecret: 'uH7CqsEWPTgMHu7rp8UhiaoS7bzgN53h3od95BEJBFEgUQzMOq',
        callbackURL: `/auth/twitter/callback`,
      },
      (token, tokenSecret, profile, done) => {
        const user = {
          providerId: profile.id,
          fbProviderId: null,
          username: null,
          name: profile.displayName ||
            (profile.name &&
              `${profile.name.givenName} ${profile.name.familyName}`) ||
            null,
          email: (profile.emails &&
            profile.emails.length > 0 &&
            profile.emails[0].value) ||
            null,
          profilePhoto: (profile.photos &&
            profile.photos.length > 0 &&
            profile.photos[0].value) ||
            null,
          createdAt: new Date(),
          lastSeen: new Date(),
        };

        createOrFindUser(user)
          .then(user => Promise.all([user, createNewUsersSettings(user.id)]))
          .then(([user]) => {
            done(null, user);
          })
          .catch(err => {
            done(err);
          });
      }
    )
  );

  // Set up Facebook login
  passport.use(
    new FacebookStrategy(
      {
        clientID: '130723117513387',
        clientSecret: 'a153e155c4562f9c04826629f4b8f21c',
        callbackURL: `/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'email', 'photos'],
      },
      (token, tokenSecret, profile, done) => {
        const user = {
          providerId: null,
          fbProviderId: profile.id,
          username: null,
          name: profile.displayName,
          email: profile.emails.length > 0 &&
            profile.emails[0].value !== undefined
            ? profile.emails[0].value
            : null,
          profilePhoto: profile.photos &&
            profile.photos.length > 0 &&
            profile.photos[0].value !== undefined
            ? profile.photos[0].value
            : null,
          createdAt: new Date(),
          lastSeen: new Date(),
        };

        createOrFindUser(user)
          .then(user => Promise.all([user, createNewUsersSettings(user.id)]))
          .then(([user]) => {
            done(null, user);
          })
          .catch(err => {
            done(err);
          });
      }
    )
  );
};

module.exports = {
  init,
};
