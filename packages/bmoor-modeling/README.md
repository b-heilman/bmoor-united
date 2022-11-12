# bmoor-modeling - Help your code do more
### Ethos
A lot of companies don't utilize their data.  I want to allow people to do two things:
1. Descibe, understand, and visualize their data
2. Allow access to ther data through one unified schema

What I am not trying to do is create a query engine.  I am hoping to offload those complexities to the adapters themselves.  I am looking to be a layer in top of Trino, Mongo, or your favorite SQL engine.

### Glossary
- *structure*: The structure of your data and what it means
- *model*: The location of your data and where to find it
- *service*: How to access your data and apply any crud life cycle hooks

