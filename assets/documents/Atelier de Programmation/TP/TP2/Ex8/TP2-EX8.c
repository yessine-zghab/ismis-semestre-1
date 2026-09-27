#include <stdio.h>

int main() {
    int a, b;

    // Saisie des deux entiers strictement positifs avec a > b
    do {
        printf("Entrez deux entiers strictement positifs a et b (avec a > b):\n");
        printf("a = ");
        scanf("%d", &a);
        printf("b = ");
        scanf("%d", &b);
    } while (a <= 0 || b <= 0 || a <= b);

    int resultat = 0;
    int x = a;
    int y = b;

    // Simulation de la multiplication
    while (y != 0) {
        if (y % 2 == 1) { // y impair
            resultat += x;
            y = y - 1;
        } else { // y pair
            x = x * 2;
            y = y / 2;
        }
    }

    printf("Le résultat de %d * %d est : %d\n", a, b, resultat);

    return 0;
}