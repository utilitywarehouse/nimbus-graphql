import { RepositoryMetadata } from '../repository.metadata';

class TestClass {

}

test('setting for class object and constructor', () => {

  const expected = TestClass.prototype;

  const classInstance = new TestClass();

  expect(RepositoryMetadata.getType(TestClass)).toBe(expected);
  expect(RepositoryMetadata.getType(classInstance)).toBe(classInstance);
  expect(RepositoryMetadata.getType(new TestClass().constructor)).toBe(expected);

});
