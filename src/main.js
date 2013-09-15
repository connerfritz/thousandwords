define(["./thousandwords"],
  function (ThousandWords) {
    var thousandwords = new ThousandWords("div#wow", {src: "PIA18461.jpg", width: 1920, height: 1080});
    document.onclick = function() {
      console.log(thousandwords.getImage());
    }
  }
)
