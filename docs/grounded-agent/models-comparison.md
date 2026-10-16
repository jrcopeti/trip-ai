# Models comparison: Sonnet 5.5 and Opus 5.5 on one trip

One trip request generated on each model, 2026-10-16, to decide whether a stronger model is
worth its price while `submit_trip` intermittently sends `tours` as a string (see 2f in
`PLAN.md`). One trip per model: this is a reading of two outputs, not a measurement of
quality or of failure rates. Branch 6's evals are where that gets measured.

## The request

Identical on both: Lisbon, Portugal, 16–21 Oct 2026 (five nights, planned by the forecast),
a couple aged 25–30, cultural, balanced pace, hotel, carry-on, plane, comfort budget,
architecture as the only interest, no passport, note or required items. Same system prompt,
same `submit_trip` tool (`strict: true`, `tool_choice: auto`), same `max_tokens` (16000), no
effort set (Sonnet 5.5 defaults to `high`, Opus 5.5 to `medium`).

| | Sonnet 5.5 | Opus 5.5 |
|---|---|---|
| Trip | `/saved-trips/10` (Neon) | `/trips/a451cdb4e12f` (local e2e database) |
| Title | SonnetCheck's Lisbon: Tiles, Towers and Tagus Light | Opuscheck's Lisbon: tiles, towers and seven hills |
| Valid on the first call | Yes | Yes |
| Tour words (asked 110–130) | 112–121 | 122–129 |
| Tours carousel at 390px | 849px on an earlier Sonnet trip at 110–130 words (this one not measured) | 937px, taller than the 844px screen |
| Packing list | 12 items | 11 items |
| Description, tip | One long paragraph each | Two paragraphs each |
| Time | 38–69s across 8 runs | 73s |
| Cost | ≈ $0.027 (measured in 1c-b) | ≈ $0.175 |

## Cost

Prices per MTok: Sonnet 5.5 $2 input, $10 output; Opus 5.5 $4 input, $20 output; cache reads
$0.20 on both. The Opus trip's usage:

| | Tokens | Cost |
|---|---|---|
| Input | 425 | $0.002 |
| Cache write (system prompt) | 2,198 | $0.011 |
| Output | 8,103, of which 5,345 thinking | $0.162 |
| **Total** | | **≈ $0.175** |

Opus costs twice Sonnet per token, but this trip cost about six times as much, because of
the thinking: two thirds of its output. The Sonnet trip costed in 1c-b used no thinking
tokens. Opus 5.5 cannot turn thinking off; effort is the only control, and `low` was not tried.

## The tours

Four of five cover the same places:

| | Sonnet 5.5 | Opus 5.5 |
|---|---|---|
| 1 | Jerónimos Monastery and Belém Waterfront | Jerónimos Monastery and Belém Tower |
| 2 | Alfama, São Jorge Castle and Sé | Sintra's Pena Palace and Regaleira |
| 3 | Sintra's Palaces by Train | Alfama tiles and sunset viewpoints (with fado) |
| 4 | MAAT and the Power Station | MAAT and LX Factory |
| 5 | Chiado, Carmo Ruins and Fado | Parque das Nações modern architecture |

## Where Opus is better

- **More architecture, the one interest given.** It names the architects (Amanda Levete,
  Santiago Calatrava, Álvaro Siza) and covers Lisbon from Manueline to Expo '98; its fifth
  tour is modern architecture (Gare do Oriente, Siza's Portuguese Pavilion). It ties a tour to
  the interest explicitly: "suits your interest in how buildings are reused, not just built".
  Sonnet stays on topic (Manueline, the Pombaline grid, MAAT) with less depth.
- **Schedule awareness.** Jerónimos closes on Mondays and MAAT on Tuesdays; the tip keeps
  Monday for Sintra or Alfama; the last tour is "a flat, unhurried final day before your
  Wednesday flight". Sonnet has none of this.
- **Must-haves that don't repeat the packing list.** Opus's six are documents, cards, a charger
  and insurance. Sonnet repeats two packing items (walking shoes, plug adapters) and lists a
  to-do ("Timed tickets booked ahead") as a must-have.
- **Packing follows the forecast.** Opus packs no rain gear for a dry forecast; Sonnet packs a
  rain jacket "in case" on a trip planned by the forecast.
- **A conditional plug adapter.** Opus: "if your devices aren't European". Sonnet packs two,
  which is wrong for a European traveller.
- **A concrete tip.** Opus: the Viva Viagem card with Zapping credit, the red metro line from
  the airport, tram 28 early or not at all, the Glória and Bica funiculars, slippery limestone
  even when dry. Sonnet's tip contradicts itself: take the metro from the airport, then ask the
  hotel for a taxi because wheeling a case over cobbles is tiring.

## Where Sonnet holds up

- Its tours are as concrete and correct (tram 15 from Cais do Sodré, Central Tejo from the
  early 1900s, MAAT from 2016), and closer to one even length.
- It uses the comfort budget explicitly ("a good table and a proper fado house rather than a
  tourist show"), and makes the indoor MAAT its rainy-day fallback.
- It fits the phone: Opus writes to the top of the word range, and its carousel overflows at 390.
- Unverified: its tip forecasts the departure day at 14°C, low for a Lisbon midday in October.
  It may have been the forecast at the time.

Neither trip has a factual error found in what could be checked (opening days, architects,
transport).

## Reliability

Sonnet 5.5 sent `tours` as a string in 1 of 10 real trips on 2026-10-16, and twice before that
in dev. The captured string (2f's `DIAG` log) held one tour, broke into a second paragraph and
stopped: 760 characters, unterminated, the other four tours never written. `strict: true` is
documented as guaranteeing the input matches the schema, so this looks like an API-side
failure rather than a model's choice, and a stronger model is not a sure cure. One Opus trip
says nothing about its failure rate.

## Recommendation

Stay on Sonnet 5.5. Opus's lead is moderate, not worth six times the cost per trip, and most of
it can be asked for in the prompt:

1. Must-haves are documents, money and tickets, never items already on the packing list.
2. Pack for the forecast given; rain gear only when it forecasts rain.
3. Note when a suggested place is closed on one of the trip's days.

The string failure would be handled by a retry that tells the model what failed (proposed as 2f-a),
not by a model change. Branch 6's evals can measure both models on cost, quality and invalid
trips before this is revisited.
