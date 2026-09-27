


// Il7a9 il énoncer moch watha7 tlijjim tifhmo b akthar min tari9a aho gemini 3takom isla7 :)



#include <stdio.h>

// 1. Declaration of global integer variables
int iHeures, iMinutes, iSecondes;

// 2. Procedure to display the time with singular/plural logic
void affiche_heure() {
    printf("Il est ");

    // Hours logic
    printf("%d heure%s ", iHeures, (iHeures > 1) ? "s" : "");

    // Minutes logic
    printf("%d minute%s ", iMinutes, (iMinutes > 1) ? "s" : "");

    // Seconds logic
    printf("%d seconde%s\n", iSecondes, (iSecondes > 1) ? "s" : "");
}

// 3. Procedure to set the time using three parameters
void saisir_heure(int iH, int iM, int iS) {
    iHeures = iH;
    iMinutes = iM;
    iSecondes = iS;
}

// 4. Procedure to increment the time by one second
void tick() {
    iSecondes++;

    if (iSecondes >= 60) {
        iSecondes = 0;
        iMinutes++;

        if (iMinutes >= 60) {
            iMinutes = 0;
            iHeures++;

            if (iHeures >= 24) {
                iHeures = 0;
            }
        }
    }
}

// 5. Main procedure: Test suite
int main() {
    // Test 1: Setting a specific time
    printf("Test 1: Initialisation à 1h 1m 1s\n");
    saisir_heure(1, 1, 1);
    affiche_heure();

    // Test 2: Testing plurals
    printf("\nTest 2: Passage au pluriel (2h 2m 2s)\n");
    saisir_heure(2, 2, 2);
    affiche_heure();

    // Test 3: Testing the tick (transition of minute)
    printf("\nTest 3: Test du tick (59 secondes -> minute suivante)\n");
    saisir_heure(10, 30, 59);
    printf("Avant tick: "); affiche_heure();
    tick();
    printf("Après tick: "); affiche_heure();

    // Test 4: Testing the tick (transition of day)
    printf("\nTest 4: Test du tick (Minuit)\n");
    saisir_heure(23, 59, 59);
    printf("Avant tick: "); affiche_heure();
    tick();
    printf("Après tick: "); affiche_heure();

    return 0;
}
