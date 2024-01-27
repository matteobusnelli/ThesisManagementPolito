# RETROSPECTIVE 4 (Team 13)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed: 6 done: 6
- Total points committed: 19 done: 19
- Nr of hours planned: 112 spent: 111:35

**Remember** a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 16      | -      | 54:30      | 53:00        |
| #16   | 3       | 3      | 5:00       | 3:30         |
| #26   | 7       | 3      | 14:00      | 17:10        |
| #27   | 4       | 5      | 15:00      | 15:10        |
| #28   | 2       | 3      | 7:00       | 7:00         |
| #29   | 3       | 3      | 7:30       | 6:30         |
| #35   | 3       | 2      | 7:30       | 9:15         |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Average hours per task Actual: 176m ---- Estimated: 177m
- Standard deviation of tasks for actual time: 110m ---- for estimation: 91m

- Total task estimation error ratio: (112/111.5)-1 = 0.4 %
  sum of total hours estimation / sum of total hours spent -1

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated: 13:00
  - Total hours spent: 12:15
  - Nr of automated unit test cases: 233
  - Coverage (if available): 93.39%
- E2E testing:
  - Total hours estimated: 3:40
  - Total hours spent: 3:30
- Code review
  - Total hours estimated: 3:00
  - Total hours spent: 3:45
- Technical Debt management:
  - Total hours estimated : 2h
  - Total hours spent : 3h
  - Hours estimated for remediation by SonarQube : 11d
  - Hours estimated for remediation by SonarQube only for the selected and planned issues : 1d 6h 51m
  - Hours spent on remediation : 3h / 1d 9h 51m effort Sonar - Cloud
  - debt ratio (as reported by SonarQube under "Measures-Maintainability") : 1.0%
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability ):
  - reliability: A
  - security: A
  - maintainability: A

## ASSESSMENT

- What caused your errors in estimation (if any)?
  + In this sprint we didn't make significant errors in estimation. In fact, we worked only 25 minutes less than planned: 111h 35m instead of 112h. However, this is the result of a compensatory effort, albeit minimal. Some User Stories required more work than estimated, while others required less. The main reason is attributed to estimation errors in tasks related to writing unit tests: in some stories, it took less time than expected because some backend functions reused code pieces developed for other stories and therefore were already tested; in others, it was necessary to mock new libraries from scratch, especially the email management library, which required additional time.

- What lessons did you learn (both positive and negative) in this sprint?

  - POSITIVE: The implementation of the new documentation standard significantly improved code readability and collaboration among team members. It streamlined the development process and reduced the likelihood of integration issues during the sprint.
  - NEGATIVE: The lack of data within the database makes it challenging to test the application and to prepare a demo.

- Which improvement goals set in the previous retrospective were you able to achieve?

  - In this sprint, we committed only 6 user stories compared to the 10 in the previous sprint, reducing from 26 story points to 19. The reduced workload allowed us to focus more on refactoring e2e tests and documentation, both of which are now complete and comprehensive.
  - We managed technical debt much more thoroughly compared to the last sprint. In these 4 weeks, we successfully addressed all high-priority bugs and code smells, minimizing security risks.

- Which ones you were not able to achieve? Why?

  - We managed to achieve every improvement goal that we set in the last sprint.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  - Enrich our "mock" database.
    > The database we use for testing the application in e2e tests and showcasing our work during demos is fully operational but lacks data. For the next sprint, we need to identify an uncategorized task specifically dedicated to enriching the database with new "mock" entries.

- One thing you are proud of as a Team!!
  - We're proud of consistently meeting our goals and improving our processes. Our disciplined approach to coding standards and technical debt showcases our dedication to high standards.
