# Account e sincronizzazione — valutazione del 26 ottobre 2026

Stato: NON implementati. Il progetto pubblicato è statico e conserva partite e impostazioni sul dispositivo. Non contiene credenziali o configurazioni Supabase/Firebase. Non aggiungere un modulo di login che simuli una sessione locale.

Supabase è il candidato preferito per un eventuale servizio esterno: email/password e provider Google, Postgres per partite/progressi e Row Level Security per separare i proprietari. Firebase Auth + Firestore è un'alternativa valida, con regole di accesso per UID. Entrambi richiedono un progetto del proprietario configurato e test d'isolamento tra due utenti.

Prima dell'integrazione: verificare la compatibilità con l'identità gestita da Sites, senza sostituirne i flussi riservati; predisporre progetto e regione, URL e chiave pubblica client, email di verifica/reset, redirect autorizzati per il sito e app native, provider Google se desiderato. Le chiavi amministrative non devono entrare nel client.

Schema proposto: profili (user_id univoco, username univoco), partite (user_id, id locale, PGN, revisione, updated_at), tentativi, impostazioni e obiettivi. RLS su ogni operazione per auth.uid() = user_id. Nessuna lettura anonima dei progressi. Migrazione locale esplicita, idempotente; sincronizzazione con versione e conflitti visibili, senza sovrascrivere in silenzio. Logout non cancella l'archivio locale senza richiesta. Verificare revoca sessione, email duplicata, password errata, reset, conflitto offline e separazione di due account prima di pubblicare.

Fonti:
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/rules/basics
