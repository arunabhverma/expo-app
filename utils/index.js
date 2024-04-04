import moment from "moment";

export function formatCreatedAt(createdAt) {
  const now = moment();
  const created = moment(createdAt);

  if (now.diff(created, "days") < 2) {
    // If created within last 2 days, show relative time
    return created.fromNow();
  } else {
    // Otherwise, show the date
    return created.format("D MMMM YYYY");
  }
}
