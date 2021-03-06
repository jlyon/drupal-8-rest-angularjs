'use strict';

angular.module('myApp.node_nid', ['ngRoute', 'drupalService'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/node/:nid', {
            templateUrl: 'node_nid/node_nid.html',
            controller: 'NodeNidCtrl'
        });
    }])

    .controller('NodeNidCtrl', function ($scope, $routeParams, Node, User, TaxonomyTerm, Comment) {
        var anonymousUser = {
            name: [
                {
                    value: "Anonymous"
                }
            ]
        }

        $scope.tags = {}

        // Fetch node entity for current nid
        $scope.node = Node.get({nid: $routeParams.nid}, function (node) {

            // If the node isn't anonymous then fetch the user entity
            if ($scope.node.uid[0].target_id == 0) {
                $scope.node.user = anonymousUser;
            } else {
                $scope.node.user = User.get({uid: $scope.node.uid[0].target_id})
            }

            // Fetch the entity for every tag in this node.
            $scope.node.field_tags.forEach(function (element, index, array) {
                if ($scope.tags[element.target_id] == undefined) {
                    $scope.tags[element.target_id] = TaxonomyTerm.get({tid: element.target_id});
                }
            });
        });

        // Fetch the comments for this node (Using a special view in Drupal)
        $scope.comments = Comment.query({nid: $routeParams.nid});

        $scope.postComment = function () {
            // Post new comment to this node. $scope.newComment contains the http payload
            $scope.newComment.entity_type = 'node';
            $scope.newComment.field_name = 'comment';
            $scope.newComment.entity_id = [{"target_id": $routeParams.nid}];
            Comment.post({}, $scope.newComment, function (response) {
                // Comment posted, refresh the comment list
                $scope.comments = Comment.query({nid: $routeParams.nid});
            });
        }
    });