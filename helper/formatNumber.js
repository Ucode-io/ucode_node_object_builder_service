module.exports = function a (number)
{
   var newNum = "";
   var oldNumStr = number + "";
   var done = 0;
   var parts = oldNumStr.split(".");
   var newPart1 = "";
   var newPart2 = parts[1];
   for(var j= parts[0].length -1 ;j >= 0;j--)
   {   
       newNum = parts[0][j] + newNum;
       done++; 
       if((done%3) == 0)
          newNum = " " + newNum;        
   }
   newNum = (newPart2)? (newNum + "," + newPart2) : newNum;
   return newNum;    
}