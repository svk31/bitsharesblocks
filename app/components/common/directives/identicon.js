angular.module("app")

.directive("identicon", function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'account': '@',
            'empty': '@',
            'size': '@',
        },
        template: '<canvas class="identicon" height="{{size}}" width="{{size}}"></canvas>',
        link: function(scope, element, attrs) {
            draw_circle = function(context, x, y, radius) {
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI, false);
                context.fillStyle = "rgba(0, 0, 0, 0.1)";
                context.fill();
            };

            scope.$watch("account", function(value) {
                if (value) {
                    element.jdenticon(sha256(value));
                } else {
                    canvas = element.get(0);
                    context = canvas.getContext('2d');
                    centerX = canvas.width / 2;
                    centerY = canvas.height / 2;
                    radius = 10;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    draw_circle(context, 2 * radius, 2 * radius, radius);
                    draw_circle(context, centerX, 2 * radius, radius);
                    draw_circle(context, canvas.width - 2 * radius, 2 * radius, radius);
                    draw_circle(context, canvas.width - 2 * radius, centerY, radius);
                    draw_circle(context, canvas.width - 2 * radius, canvas.height - 2 * radius, radius);
                    draw_circle(context, centerX, canvas.height - 2 * radius, radius);
                    draw_circle(context, 2 * radius, canvas.height - 2 * radius, radius);
                    draw_circle(context, 2 * radius, centerY, radius);
                }
            });
        }
    };
});