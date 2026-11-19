# OR-Set

An **Observed-Remove Set with a unique Lamport clock**, implemented in TypeScript.

This project explores a set data structure that keeps separate records of additions and removals. Two sets can be merged by combining their respective add and remove records.

It was an experiment in conflict-free replicated data types (CRDTs) and functional programming in TypeScript.

## How it works

An `OrSet` contains two sets:

- `addSet` — records elements that have been added.
- `removeSet` — records elements that have been removed.

Each element is represented by a `Data<T>` record:

```ts
type Data<T> = {
  id: string;
  data: T;
  clock: number;
};
```

The implementation identifies records by their `id` and `clock`. The caller supplies those values; the library does not generate IDs or advance Lamport clocks.

`lookUp` returns the records in the add set that do not have a matching record in the remove set. `merge` combines the add and remove records from two sets.

## Example

```ts
import { add, lookUp, merge, remove, type Data, type OrSet } from 'u-orset';

type Item = { name: string };

const empty = (): OrSet<Item> => ({
  addSet: new Set(),
  removeSet: new Set(),
});

const apple: Data<Item> = {
  id: 'apple',
  data: { name: 'Apple' },
  clock: 1,
};

const banana: Data<Item> = {
  id: 'banana',
  data: { name: 'Banana' },
  clock: 2,
};

const first = add(empty(), apple);
const second = add(empty(), banana);

const combined = merge(first, second);

// The merged set contains both records.
console.log(lookUp(combined));

const afterRemoval = remove(combined, apple);

// The matching apple record is excluded from the lookup.
console.log(lookUp(afterRemoval));
```

The example assumes that each addition is assigned an appropriate unique `id` and `clock` pair. Removing a record requires the corresponding identity and clock.

## API

### Types

#### `Data<T>`

A record containing an ID, a value, and a clock.

#### `OrSet<T>`

An object containing `addSet` and `removeSet`.

### Functions

#### `add(orSet, data)`

Returns an OR-Set with the supplied record added to `addSet`.

#### `remove(orSet, data)`

Returns an OR-Set with the supplied record added to `removeSet`.

#### `merge(orSetA, orSetB)`

Combines the add and remove records from two OR-Sets.

#### `lookUp(orSet)`

Returns the added records that do not have a matching removal record.

#### `ordData` and `ordDataOf`

Provide ordering helpers for `Data` records. The default ordering compares their clocks.

## Development

Install dependencies and build:

```sh
npm install
npm run build
```

Format the TypeScript source:

```sh
npm run format
```

Run the configured linter:

```sh
npm run lint
```

## Project status

This is an older experimental implementation. The repository does not currently contain an automated test suite: `npm test` is a placeholder and exits with an error.

The source imports `fp-ts`, which is currently listed as a development dependency. Review the package configuration and test the library in a consuming project before relying on it.

The implementation does not manage replica identities, generate clocks, or provide networking and persistence. Those responsibilities belong to the application using it.

## License

[MIT](LICENSE)
