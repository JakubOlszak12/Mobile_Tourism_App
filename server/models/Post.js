/* eslint-disable require-jsdoc */
class Post {
  constructor(imageName, text, type, timestamp, userId, username, avatar) {
    (this.imageName = imageName),
    (this.text = text),
    (this.type = type);
    (this.timestamp = timestamp);
    (this.userId = userId),
    (this.username) = username,
    (this.avatar) = avatar;
  }
}
module.exports = Post;
