RETROSPECTIVE 2 (Team 13)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done : 3 committed, 3 done
- Total points committed vs. done: points committed = 6, points done = 6
- Nr of hours planned vs. spent (as a team): hours planned = 112, hours spent = 112:45

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!)

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| #4 	|     2	|    2	|   8:00   	|        4:30	|
| #5  	|     3	|    2	|   9:00		|       8:15   	|
| #6  	|     4	|    2	|   9:30  	|       8:10  	|
| #0  	|     18	|    	|   88:30 	|       91:51   	|

   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Average hours per task    Actual: 250 M ---- Estimated: 249 M
- Standard deviation of tasks   for estimation: 2.48 / for actual time: 3.43
- Standard deviation of stories   for estimation: 34.5  / for actual time: 36.7

- Total task estimation error ratio: (112/112.75)-1 = - 0.6 %


 
## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated : 15:30
  - Total hours spent : 11:30
  - Nr of automated unit test cases: 102 
  - Coverage (if available): 100%
- E2E testing:
  - Total hours estimated : 3
  - Total hours spent : 2
- Code review
  - Total hours estimated : 2
  - Total hours spent : 1


## ASSESSMENT


- What caused your errors in estimation (if any)?
  + In this sprint, we did not make evaluation errors as significant as those made in the last iteration. Armed with the experience from two weeks ago, this time we were able to assess the time needed to complete each task more accurately, exceeding our time budget by just 45 minutes.

- What lessons did you learn (both positive and negative) in this sprint?
  + POSITIVE: Technical meetings are essential for improve communication, collaboration, and problem-solving within a team.
  + NEGATIVE: We have to improve our presentation skills and give us more time to prepare for the demo better.

- Which improvement goals set in the previous retrospective were you able to achieve?
  + During this sprint, we were able to manage the Git repository much more effectively. The insight we gained in the last retrospective proved to be correct: minimizing the number of branches to work on saved us numerous hours of work.
  + We have greatly optimized the writing of tests
	* As for unit tests, we have modified the entire structure of our code to make functions more modular, composed of separate and small portions that are easier to test.
	* Regarding end-to-end (e2e) tests, we have made a simple and effective template that allows us to run a substantial number of them in a short amount of time.
  + We understood what didn't work in the time tracking on YouTrack and promptly corrected the faulty configuration.
 
- Which ones you were not able to achieve? Why?
  + For what concerns the second point, we cannot claim to have fully achieved our goal. We have made significant strides with code rewriting and defining a template for tests, but we have not managed to complete the refactor of tests 100%. Due to the extensive workload associated with other parts of the project, we were able to refactor all unit tests, write new ones for the functions of this sprint, and produce an initial set of limited e2e tests. However, we were unable to complete the refactoring process.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  + Complete the refactoring of the e2e tests
	> During the next sprint, we will need to allocate a task of several hours to complete the writing of e2e tests following the template identified in this iteration. Alternatively, if the workload is again very high, we can decide not to repay this technical debt.
  + Commit more story points
	> In this sprint, we committed only 6 story points compared to the 15 in the last iteration. This is because we had to refactor a significant portion of our back-end, implement SAML 2.0 authentication, dockerize the application and handle many uncategorized tasks. In the next sprint there should be fewer cross-functional tasks, allowing us to focus more on the development of new user stories.
  + Increasing the frequency of technical meetings
	> In the last sprint, we utilized technical meetings only once to determine the structure of our database. In this sprint, however, we held only one meeting to address some urgent front-end issues. In the upcoming sprint, we will need to increase the number and frequency of technical meetings to better organize code writing and minimize the introduction of bugs.

- One thing you are proud of as a Team!!
  + We have learned to organize ourselves efficiently and functionally, to interact better with each other and to manage performance anxiety before and during the demo more effectively.
