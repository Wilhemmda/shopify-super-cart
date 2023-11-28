/**
 * 
 * @param {string} liquid Some liquid file to modify
 * @param {string} input String to put into a div
 * @returns 
 */
function addDivAfterForm(liquid, input) {
    // Recherche la position de "</form>"
    const positionForm = liquid.indexOf("</form>");
  
    // Si "</form>" est trouvé
    if (positionForm !== -1) {
      // Ajoute un retour à la ligne et "<div>Something</div>" à cet endroit
      const output =
      liquid.slice(0, positionForm + 7) + `\n<div name="bottomOption">${input}</div>` + liquid.slice(positionForm + 7);
  
      return output;
    }
  
    // Si "</form>" n'est pas trouvé, renvoie la chaîne d'entrée inchangée
    return liquid;
  }
  
  function deleteDivAfterForm(liquid) {
    // Recherche la position de "</form>"
    const positionForm = liquid.indexOf("</form>");
  
    // Si "</form>" est trouvé
    if (positionForm !== -1) {
      // Trouve la position de la prochaine balise <div> après "</form>"
      const positionDivDebut = liquid.indexOf("<div", positionForm);
  
      // Si une balise <div> est trouvée
      if (positionDivDebut !== -1) {
        // Trouve la position du nom dans la balise <div>
        const positionNom = liquid.indexOf("bottomOption", positionDivDebut);
  
        // Si le nom spécifique est trouvé dans la balise <div>
        if (positionNom !== -1) {
          // Trouve la position de la fin de la balise <div>
          const positionDivFin = liquid.indexOf('</div>', positionNom);
  
          // Supprime la ligne de la balise <div>
          const resultat = liquid.slice(0, positionDivDebut) + liquid.slice(positionDivFin + 6);
  
          return resultat;
        }
      }
    }
  
    // Si "</form>" ou la balise <div> ne sont pas trouvées, renvoie la chaîne d'entrée inchangée
    return liquid;
  }