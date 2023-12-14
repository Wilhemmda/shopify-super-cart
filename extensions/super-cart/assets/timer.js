(function() {
  // Set the date we're counting down to
const today = new Date
// const countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();
let futureDate = new Date("Dec 9, 2023 15:37:25").getTime();
// Update the count down every 1 second
const x = setInterval(function() {

  // Get today's date and time
  let now = new Date();


  // Find the distance between now and the count down date
  const distance = futureDate - now.getTime();

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("counter").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("counter").innerHTML = "EXPIRED";
  }
}, 1000);
}
)