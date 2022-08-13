class User {
  constructor(
    id,
    firstName,
    lastName,
    email,
    country,
    twitchBroadcasterType,
    twitchDisplayName,
    twitchId,
    twitchEmail,
    twitchProfileImageUrl,
    walletAddress,
    walletType
  ) {
    (this.id = id),
      (this.firstName = firstName),
      (this.lastName = lastName),
      (this.email = email),
      (this.country = country),
      (this.twitchBroadcasterType = twitchBroadcasterType),
      (this.twitchDisplayName = twitchDisplayName),
      (this.twitchId = twitchId),
      (this.twitchEmail = twitchEmail),
      (this.twitchProfileImageUrl = twitchProfileImageUrl),
      (this.walletAddress = walletAddress);
    this.walletType = walletType;
  }
}
