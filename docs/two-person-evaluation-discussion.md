# Two-person evaluation: decisions before implementation

Albhy's September 2026 direction is a working evaluation service where two people take assessments and receive AI advice.

## Current implementation

Each signed-in user owns their `people` and `groups` records. The UI can create people under that owner's account, record assessments for them, and average members' latest results into a group profile. Ownership is enforced in migration `00016` and the relationship actions. This does not connect two independently authenticated people through invitations and shared consent. The code inspected has no AI-advice generation flow.

Passkeys improve account re-entry but do not determine how two accounts share information. The source question pools now have 600 items per axis, with a manuscript-review CSV available under `docs/question-bank`. Live questionnaires remain separately versioned static files.

## Proposed first release for discussion

Two adults each use their own account and take their own assessment. One invites the other into a private pair. Both explicitly choose which assessment snapshot to share and approve creating a joint report. The report offers communication suggestions and reflection exercises based on those snapshots, names the limits of the assessment, and avoids presenting personality scores as a diagnosis or a verdict on the relationship.

These are proposed choices, not implemented behavior. Settle:

1. **First audience and output:** couples, or any two people? A shared report, separate advice for each person, or an ongoing chat?
2. **Sharing and withdrawal:** may each person see all six scores, the full answers, or only the report? What happens to a joint report when one withdraws consent or deletes an account?
3. **Advice standard:** which manuscript version and examples define a useful answer? Who signs off on wording, limits, and situations where the service should refrain from advice?

Once agreed, implementation can proceed through invitations and account linking; consent and assessment snapshots; report generation with recorded prompt/model/manuscript versions; and an end-to-end acceptance test with two independent accounts. Define retake behavior explicitly so one person's later assessment cannot silently change an existing report.
