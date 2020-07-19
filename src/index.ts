import * as fSet from 'fp-ts/lib/Set';
import { Eq } from 'fp-ts/lib/Eq';
import { Ord } from 'fp-ts/lib/Ord';
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

export type OrSet<T> = {
  addSet: Set<Data<T>>,
  removeSet: Set<Data<T>>
}

const ordCompare = <T>(x: Data<T>, y: Data<T>) => x.clock < y.clock ? -1 : x.clock > y.clock ? 1 : 0

export const ordDataOf= <T>(ordCompare: (x: Data<T>, y: Data<T>) => Ordering): Ord<Data<T>> => ({
  equals: eqData.equals,
  compare: ordCompare
});

export const ordData = ordDataOf(ordCompare);

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
