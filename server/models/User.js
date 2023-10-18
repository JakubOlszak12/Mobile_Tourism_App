class User {
  constructor(
      email,
      password,
      username,
      description,
      created_at,
      edited_at,
      last_logon,
      account_typeId,
      statusId,
      followers,
      follows,
      finished_routes,
      achievements,
      avatar,
      notifications,
  ) {
    (this.email = email),
    (this.password = password),
    (this.username = username),
    (this.description = description),
    (this.created_at = created_at),
    (this.edited_at = edited_at),
    (this.last_logon = last_logon),
    (this.account_typeId = account_typeId),
    (this.statusId = statusId),
    (this.followers = followers),
    (this.follows = follows),
    (this.finished_routes = finished_routes),
    (this.achievements = achievements);
    this.avatar = avatar;
    this.notifications = notifications;
  }
}
module.exports = User;
