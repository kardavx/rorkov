# Instalacja repo

1. Pobierz NODE z https://nodejs.org/en
2. po instalacji w cmd wklej: npm install -g npm@9.8.1
3. Następnie, w tej samej sesji wklej: npm install -g roblox-ts
4. Zainstaluj aftman z https://github.com/LPGhatguy/aftman/releases, wypakuj - kliknij w exe po czym otworz sesje terminala i wpisz aftman self-install
5. Wklej w terminal nastepujaca komende i poczkeaj az serwer Rojo sie zainstaluje: aftman add rojo-rbx/rojo
6. Wklej: aftman install
7. Przejdz na github.com i skonfiguruj klucz SSH
8. Pobierz najnowszą wersje place roblox bez skryptów
9. Otwórz zainstalowany place
10. Zainstaluj plugin Rojo z https://rojo.space/docs/v7/getting-started/installation/ > Installing the plugin > from Roblox.com
11. Sklonuj repo z użyciem git clone [link z githuba po wybraniu Code > Clone > SSH]
12. Otwórz sesje terminala w swoim IDE i wklej: npm i
13. Po zakonczeniu sie instalacji paczek wklej w terminal: npm run watch
14. Otwórz kolejną sesje terminala i wklej: rojo serve
15. Przejdź na place i połącz plugin z serwerem
16. Pisz kod

# Pisanie kodu

1. Typy definiuj z użyciem PascalCase
2. Klasy definiuj z użyciem PascalCase
3. Funkcje, zmienne etc. definiuj z użyciem camelCase
4. Pliki nazywaj z użyciem snake_case

# Skrypty npm

## `npm run devbuild`
Kompiluje projekt do lua, tworzy plik `devbuild.rbxl` zawierający wszystkie modele gry i od razu otwiera go w roblox studio. Używaj go tylko jeśli nie masz place z aktualnymi modelami

## `npm run build`
Kompiluje projekt do lua i od razu uruchamia server rojo. Używaj gdy już masz place z modelami i potrzebujesz przetestować kod.

## `npm run watch`
Uruchamia `rbxtsc` w trybie watch - kompilacja sie uruchamia przy kazdym zapisie/utworzeniu pliku w folderze projektu