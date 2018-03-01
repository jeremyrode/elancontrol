

%get the data out of the fig
ax = gca;
lines = ax.Children;


figure
hold on
%% Make a markdown table out of scope data
disp('CODES:')
for x=1:length(lines)
    code = diff(find(diff((lines(x).YData>6)) > .5));
    fprintf('| %s | ',lines(x).DisplayName)
    for y=6:length(code)
        if code(y) > 6000
            fprintf('S ')
        else
            fprintf('L ')
        end
    end
    disp(' |')
end