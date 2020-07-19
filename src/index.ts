import * as fSet from 'fp-ts/lib/Set';
import { Eq, eqNumber } from 'fp-ts/lib/Eq';
import { ordNumber, Ord } from 'fp-ts/lib/Ord';
import { pipe } from 'fp-ts/lib/function';
import { Ordering } from 'fp-ts/lib/Ordering';

/**
 * OR-Set with Lamport Clock in Each Element.
 * 
 * Properties: Each add or remove Set has a unique timestamp
 */

export type Data<T> = {
  id: string,
  data: T,
  clock: number
}

const dataEqPred = <T>(dat1: Data<T>, dat2: Data<T>) => dat1.id === dat2.id && dat1.clock === dat2.clock

const eqDataOf = <T>(dataEqPred: <T>(dat1: Data<T>, dat2: Data<T>) => boolean): Eq<Data<T>> => ({
  equals: dataEqPred
});

const eqData = eqDataOf(dataEqPred);

const fromDataArrayOf = <T>(eqData: Eq<Data<T>>) => fSet.fromArray(eqData);

const fromDataArray = <T>(dataArr: Data<T>[]) => fromDataArrayOf<T>(eqData)(dataArr);

export type OrSet<T> = {
  addSet: Set<Data<T>>,
  removeSet: Set<Data<T>>
}

const eqOrSetPred = <T>(x: OrSet<T>, y: OrSet<T>): boolean => {
  const isAddSetEqual = fSet.getEq(eqData).equals(x.addSet, y.addSet);
  const isRemoveSetEqual = fSet.getEq(eqData).equals(x.removeSet, y.removeSet);
  return isAddSetEqual && isRemoveSetEqual;
};

const eqOrSetOf = <T>(pred: (x: OrSet<T>, y: OrSet<T>) => boolean): Eq<OrSet<T>> => ({
  equals: pred
});

const eqOrSet = eqOrSetOf(eqOrSetPred);

const ordCompare = <T>(x: Data<T>, y: Data<T>) => x.clock < y.clock ? -1 : x.clock > y.clock ? 1 : 0

export const ordDataOf= <T>(ordCompare: (x: Data<T>, y: Data<T>) => Ordering): Ord<Data<T>> => ({
  equals: eqData.equals,
  compare: ordCompare
});

export const ordData = ordDataOf(ordCompare);

const orSetSample: OrSet<number> = {
  addSet: fromDataArray(
    [{ id: '1', data: 1, clock: 1 },
    { id: '2', data: 2, clock: 2 },
    { id: '3', data: 3, clock: 3 },
    { id: '5', data: 5, clock: 6 },
    { id: '4', data: 4, clock: 5 }
    ])
  , removeSet: fromDataArray(
    [{ id: '1', data: 1, clock: 4 },
    { id: '3', data: 3, clock: 7 }
    ]
  )
};

const maxNum = (x: number, y: number): number => x > y ? x : y;

const setMaxClock = <T>(initialClock: number, set: Set<Data<T>>) =>
  pipe(
    set,
    fSet.map(eqNumber)(x => x.clock),
    fSet.reduce(ordNumber)(initialClock, maxNum)
  );

const maxClock = <T>(orSet: OrSet<T>): number =>
  setMaxClock(setMaxClock(0, orSet.addSet), orSet.removeSet);

export const add = <T>(orSet: OrSet<T>, data: Data<T>): OrSet<T> =>
  ({ ...orSet, addSet: fSet.insert<Data<T>>(eqData)(data)(orSet.addSet) });

export const remove = <T>(orSet: OrSet<T>, data: Data<T>): OrSet<T> =>
  ({ ...orSet, removeSet: fSet.insert<Data<T>>(eqData)(data)(orSet.removeSet) });

export const merge = <T>(orSetA: OrSet<T>, orSetB: OrSet<T>): OrSet<T> =>
  ({
    addSet: fSet.union<Data<T>>(eqData)(orSetA.addSet, orSetB.addSet),
    removeSet: fSet.union<Data<T>>(eqData)(orSetA.removeSet, orSetB.removeSet)
  });

export const lookUp = <T>(orSet: OrSet<T>): Set<Data<T>> =>
  fSet.difference<Data<T>>(eqData)(orSet.removeSet)(orSet.addSet);
