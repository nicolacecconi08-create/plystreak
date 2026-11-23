# Prompt di revisione Plystreak

Esegui tre passaggi consecutivi sul codice corrente. In ogni passaggio individua un problema riproducibile, segui i dati fino alla causa, applica la modifica minima che rispetta le funzioni esistenti e aggiungi una verifica significativa. Usa solo partite sintetiche; conserva le impostazioni, gli archivi e i checkpoint. Non inventare valutazioni scacchistiche e non presentare come verificati i risultati che non puoi misurare. Verifica separatamente lingue, funzionalità offline e canale Windows quando vengono toccati. Non caricare dati o segreti degli utenti.

1. **Dati e ripresa:** controlla backup, migrazioni e code Chess.com, includendo interruzioni e ripristino. Impedisci la perdita silenziosa del lavoro già messo in coda.
2. **Aggiornamenti e resilienza:** controlla avvio, permessi di archiviazione, versioni in attesa e uso con più pagine. Non riavviare durante un’interazione e mantieni utilizzabile l’app se l’archiviazione non è disponibile.
3. **Interfaccia e traduzioni:** controlla etichette, stati e risultati generati dinamicamente nelle cinque lingue. Correggi stringhe effettivamente mancanti e verifica che la notazione scacchistica non cambi.

Dopo i tre passaggi, esegui i test pertinenti; rigenera il pacchetto offline e il core Windows con una versione nuova; verifica integrità, pubblica su GitHub e sul sito e riferisci i limiti delle verifiche.
