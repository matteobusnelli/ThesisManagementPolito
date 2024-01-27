RETROSPECTIVE 1 (Team 13)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done : 8 stories estimated, 3 committed, 3 done
- Total points committed vs. done: points committed = 15, points done =15
- Nr of hours planned vs. spent (as a team): hours planned = 112 , hours spent = 117:45

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!)

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| #1 	|     7	|    5	|   20:00   	|       24:40  	|
| #2  	|     8	|    5	|   23:00	|       19:15   	|
| #3  	|     9	|    5	|   22:00  	|       21:10  	|
| #0  	|     16	|    	|   47:00 	|       52:40   	|

   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Average hours per task    Actual: 176 M ---- Estimated: 168 M
- Standard deviation of tasks   for estimation: 3.46 / for actual time: 3.21
- Standard deviation of stories   for estimation: 11.02  / for actual time: 13.56

- Total task estimation error ratio: (112/117.75)-1 = - 4.8 %


 
## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated : 4
  - Total hours spent : 1:30
  - Nr of automated unit test cases 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated : 11
  - Total hours spent : 15:30
- Code review
  - Total hours estimated : 6
  - Total hours spent : 4:30


## ASSESSMENT


- What caused your errors in estimation (if any)?
    + Some group members had difficulty saving changes they made to their timesheet. As a result, some hours of work were not accounted for
    + We didn't understand the format to give to the tests until a few days before delivery, which led us to have to rewrite them multiple  times
    + During the sprint we worked on numerous different branches. This led to numerous difficulties in the final merge. Although we managed to finish the merge within the hours required by the tasks related to git repository management (see point 3), we had to resolve too many conflict errors

- What lessons did you learn (both positive and negative) in this sprint?
    + NEGATIVE: Generating too many branches in the github repository is counterproductive
    + POSITIVE: Splitting stories into differentes and small groups helps the team to be more efficiente and improve our communication

- Which improvement goals set in the previous retrospective were you able to achieve?
    + Strengthened by the experience gained during the first project, in this sprint we estimated more precisely the time necessary to complete different categories of tasks, especially those linked to the management of the sprint itself
    + In this sprint we organized ourselves in such a way that the documentation of a piece of code was done by whoever wrote that code
    + This time we created uncategorized tasks specifically to track the time spent managing branches in the git repository
    + At the beginning of the sprint, right after sprint planning, we discussed about the database structure. This allowed us to build a stable version of the back-end right from the start
 
- Which ones you were not able to achieve? Why?
    + Based on what was said in point 1, we can consider the first improvement goal only partially achieved: we better estimated the time needed to manage the git repository but we started to merge our solutions too late and we encountered many problems to resolve conflicts

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
    + Minimize the hassle of managing github repository
        > In the last retrospective we thought about increasing the time allocated to tasks related to repository management. We did it but next time we must also think about reducing the number of branches to be merged to a minimum.
    + Optimize test writing
        > Now that we know how tests should be done, we have to make a general template that can help us speed up their writing.
        > From now on we have to write the code in a more modular way in order to facilitate the testing of the various functions: testing 10 small modules is easier and faster than testing a big one
    + Improve time tracking on youtrack
        > We need to find what went wrong in the collection of data in timesheets and try to fix it as soon as possible

- One thing you are proud of as a Team!!
     + Despite the problems encountered, we managed to deliver the demo on time and our bond got stronger 


