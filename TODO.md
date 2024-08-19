- [] rozjet prettier + eslint na CI
- [] udělat mapu frontend stránek webu (jestli jsou reaktivní nebo ne, jaké používají API)
- [] podívat se, jestli Django zvládne SSR (+ Svelte)

Mapa stránek:
### User pages
- Navigace:
    - Requests:
        - /api/info - Info o uživateli
        - /api/all - Notifikace
        - /api/seach - POUZE UČITELÉ - zobrazuje asi nějaký vyhledávání, které není implementované a vrací text a url, na kterou to má pak odkazovat
    - Responzivita:
        - Light/Dark mode - ano

- /:
    - Requests:
        - Žádný
    - Responzivita:
        - Výběr semestru - ne
- /task/\<int\>/\<name\>:
    - Requests:
        - /task/\<int\>/\<name\>/\<submit\>/comments - Komentáře na aktuálním submitu
    - Responzivita:
        - Přepínání mezi tabama (změna `active`classy)
        - Upload - ne - post a redirect
        - Změna submitu - ne - refresh (technicky by se dalo vzít data z API (jestli je) a jen přerendrovat obsah a replacenout url)
        - Po dokončení testů (pipeline) se hodí refresh (lze podobně jako změna submitu přes API jen vložit result)

### Teacher pages
- /:
    - Requests:
        - #/:
            - /api/classes/all - List tříd ve všech semestrech daného učitele
            - /api/classes?teacher=NAME - List třid, které má daný učitel
            - /api/classes?teacher=NAME&semester=SEMESTER - List tříd, které má daný učitel v daném semestru
        - #/tasks/add/\<SUBJECT\>:
            - /api/subject/\<SUBJECT\> - Info o daném předmětu
            - /api/tasks - List všech tásků daného učitele
    - Responzivita:
        - Změna semestru a načítání tříd - Ano
        - Routování mezi teacher stránkama
- /submits:
    - Requests:
        - Ne
    - Responzivita:
        - Ne
- /tasks:
    - Requests:
        - Ne
    - Responzivita:
        - Ne
- /teacher/task/\<int\>:
    - Requests:
        - Ne
    - Responzivita:
        - Pouze překlik mezi testama a assigmentem, pomocí classy `active`
Issues na fix:
- [ ] Notifikace se roztahují úplně dolů, přidat max height a scrolling https://github.com/mrlvsb/kelvin/issues/455