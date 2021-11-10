Modules don’t change how code is compiled or anything like that, they’re purely a way to organize your code, so it’s easier to reason/maintain.

You should group code together into a module if:

    You feel like it’ll improve the understanding or maintainability of the code.
    You now understand (from experience) what is that feature you built a few weeks ago and why it would be beneficial to have a dedicated module for it.
    You have related code splattered all over common (components, utils, hooks, etc.), and it feels like all those pieces should be grouped together.

Modules are the natural evolution of “big” apps. Actually, your app doesn’t need to be “big” (what’s “big” anyway?).
Here is how we decide (at Unly) if we should use a module:

    It should be composed of, at least, 2 different entities.
        Entities are: Types, Components, Utilities, Hooks, Contexts, etc.
    We know the module is small now, but it’s going to grow soon.
    Exceptionally, if it’s related to a 3rd party (e.g: modules/sentry), it can be a module.
    Exceptionally, if we feel like it should be a module, then we go for it (it doesn’t really matter anyway!).

Why using a modular design pattern?

Modules are a different way of organizing your source code, in a very different way compared to the well-known MVC design pattern.

While MVC (and many other) design pattern groups code together based on “role” of each file, our approach is different and groups related code together.

MVC is very simple to understand because you don’t have to think about it, it’s very intuitive, at first. Therefore, it’s beginner-friendly.

But, it doesn’t scale.

When you reach a dozen different features, all that code is grouped together (e.g: “Components”) even though it’s not related to each other. On the other hand, when a developer wants to do something, it’s often related to a “feature”. But, the code related to the feature is splattered in many folders and sub-folders because of the MVC pattern.

This makes it much harder to locate the code, and doesn’t give an overview of all the related pieces.

That’s why we provide a modular design pattern, for those who wishes to use it. Although, the commons folder uses an MVC-ish design pattern: You split your files based on their utility (components, etc.). That’s because it’s just simpler to comprehend and reason about, at the beginning.
