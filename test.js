const password = "yX1";
var countLower = 0;
var countUpper = 0;
var countNumber = 0;

for (let i = 0; i < password.length; i++) {
        
        if (isNaN(Number(password[i]))){
            if (password[i] === password[i].toLowerCase()) {
                countLower++;
                console.log(countLower)
            }else if (password[i] === password[i].toUpperCase()) {
                countUpper++;
            } 
        }else{
          countNumber++;
        }
    }
if (countLower > 0 && countUpper > 0 && countNumber > 0){
  console.log("Valid Password")
}else{
  console.log("Invalid")
}
