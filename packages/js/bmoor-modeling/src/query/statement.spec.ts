import {expect} from 'chai';

import { QueryStatement } from './statement';

describe('@bmoor-modeling::query/statement', function () {
	describe('::validate', function () {
        it('should not return anything if just one model', function () {
            const stmt = new QueryStatement('foo', {
                fields: [{path: 'aValue'}]
            });

            expect(stmt.validate()).to.deep.equal([]);
        });

        it('should not return anything if everything is fine', function () {
            const stmt = new QueryStatement('foo', {
                fields: [{path: 'aValue'}]
            });

            stmt.addModel('bar', {
                fields: [
                    {path: 'aValue'}
                ], 
                joins: [
                    {toSeries: 'foo', mappings: [
                        {from: 'fooId', to: 'id'}
                    ]
                }]
            });

            expect(stmt.validate()).to.deep.equal([]);
        });

		it('should catch a disconnected head', function () {
            const stmt = new QueryStatement('foo', {
                fields: [{path: 'aValue'}]
            });

            stmt.addModel('bar', {
                fields: [
                    {path: 'anotherValue'}
                ]
            });

            stmt.addModel('hello', {
                series: 'world',  
                fields: [
                    {path: 'world'}
                ], 
                joins: [
                    {toSeries: 'bar', mappings: [
                        {from: 'fooId', to: 'id'}
                    ]
                }]
            });
            
            expect(stmt.validate()).to.deep.equal([
                "Series foo is detached"
            ]);
        });

        it('should catch a disconnected model', function () {
            const stmt = new QueryStatement('foo', {
                fields: [{path: 'aValue'}]
            });

            stmt.addModel('bar', {
                fields: [
                    {path: 'anotherValue'}
                ], 
                joins: [
                    {toSeries: 'foo', mappings: [
                        {from: 'fooId', to: 'id'}
                    ]
                }]
            });

            stmt.addModel('hello', {
                series: 'world',  
                fields: [
                    {path: 'world'}
                ]
            });
            
            expect(stmt.validate()).to.deep.equal([
                "Series world is detached"
            ]);
        });
    });
});