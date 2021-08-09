module.exports = class AvatarDto {
  id;
  url;
  user;

  constructor(model) {
    this.id = model._id;
    this.url = model.url;
    this.user = model.user;
  }
};
